import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import type { Response } from 'express';

@Controller('updates')
export class UpdatesController {
  @Get('win32/:version/:file?')
  async getUpdate(
    @Param('version') version: string,
    @Param('file') file: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
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
        return res.redirect(302, s3Url);
      }

      const content = await assetResponse.text();
      res.setHeader('Content-Type', 'text/plain');
      return res.status(200).send(content);
    } catch (error) {
      console.error('[UPDATER ERROR]', error);
      return res.status(500).send('Erro interno ao buscar atualização');
    }
  }
}
