import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import type { Response } from 'express';

@Injectable()
export class ReleasesService {
  private readonly logger = new Logger(ReleasesService.name);

  async getUpdate(version: string, file: string, token: string, res: Response) {
    this.logger.log(
      `Verificando atualização para a versão ${version}, arquivo: ${file}`,
    );

    if (token !== process.env.GLOBAL_APP_TOKEN) {
      throw new UnauthorizedException('Token inválido');
    }

    const owner = 'luccas-sales';
    const repo = 'sacolao-erp';
    const githubPat = process.env.GITHUB_PAT;

    try {
      const releaseResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
        {
          headers: {
            Authorization: `Bearer ${githubPat}`,
            Accept: 'application/vnd.github.v3+json',
          },
        },
      );

      if (!releaseResponse.ok)
        throw new NotFoundException('Release não encontrada no GitHub');
      const releaseData = await releaseResponse.json();

      const asset = releaseData.assets.find((a: any) => a.name === file);
      if (!asset)
        throw new NotFoundException(
          `Arquivo ${file} não encontrado na release`,
        );

      const assetResponse = await fetch(asset.url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${githubPat}`,
          Accept: 'application/octet-stream',
        },
        redirect: 'manual',
      });

      if (assetResponse.status === 302 || assetResponse.status === 301) {
        const s3Url = assetResponse.headers.get('location') || '';

        this.logger.log(`Redirecionando download para S3 URL.`);

        return res.redirect(302, s3Url);
      }

      const content = await assetResponse.text();
      res.setHeader('Content-Type', 'text/plain');

      this.logger.log(`Conteúdo do arquivo ${file} pronto para envio.`);

      return res.status(200).send(content);
    } catch (error: any) {
      this.logger.error(
        `Erro interno ao buscar atualização no GitHub: ${error.message}`,
        error.stack,
      );
      return res.status(500).send('Erro interno ao buscar atualização');
    }
  }
}
