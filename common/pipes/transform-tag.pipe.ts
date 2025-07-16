import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseTagsPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): string[] {
    if (value === undefined || value === null) return [];

    // строка через запятую
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((v) => v.trim())
        .filter((v) => v);
    }

    // если уже массив
    if (Array.isArray(value)) {
      return value.map((v) => String(v).trim()).filter((v) => v);
    }

    throw new BadRequestException(
      'Теги должны быть строкой или массивом строк',
    );
  }
}
