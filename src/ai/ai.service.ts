import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { CancelHelpDto } from './dto/cancel-help.dto';

@Injectable()
export class AiService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getCancelHelp(dto: CancelHelpDto): Promise<string> {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    const model = this.config.get<string>('GEMINI_MODEL', 'gemini-2.0-flash');
    const baseUrl = this.config.get<string>(
      'GEMINI_API_URL',
      'https://generativelanguage.googleapis.com/v1beta',
    );

    if (!apiKey) {
      throw new InternalServerErrorException('Gemini API key not configured');
    }

    const url = `${baseUrl}/models/${model}:generateContent?key=${apiKey}`;

    const language = dto.locale || 'az';
    const platform = dto.platform || 'general';

    const prompt = `
Sən "subscription ləğvetmə assistenti"sən.

İstifadəçinin xidməti: "${dto.subscriptionName}".
Platforma: ${platform}.

Vəzifən:
- Bu xidmətin ləğvi üçün addım-addım təlimat yaz.
- Üslub: Suala cavab verən app-in içində sadə mətn kimi göstəriləcək.
- Addımları nömrələnmiş şəkildə ver (1., 2., 3. ...).
- Çox uzun olmasın, amma dəqiq olsun.
- Mümkünsə Azərbaycan dilində cavab ver.
- Əgər xidmətlə bağlı dəqiq məlumatın yoxdursa, bunu de və ümumi təklif ver:
  - "Hesab -> Subscriptions / Abunəliklər" bölməsinə bax
  - Email-lərdə "unsubscribe" linkinə kliklə, və s.

Yalnız təlimatları yaz, intro və outro yazma.
Dil: ${language}.
    `.trim();

    try {
      const response$ = this.http.post(url, {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      });

      const { data } = await firstValueFrom(response$);

      const text =
        data?.candidates?.[0]?.content?.parts
          ?.map((p: any) => p.text || '')
          .join('\n')
          .trim() ?? '';

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      return text;
    } catch (error) {
      // Burda istersen log da ata bilərsən
      throw new InternalServerErrorException(
        'AI cancel help generation failed',
      );
    }
  }
}