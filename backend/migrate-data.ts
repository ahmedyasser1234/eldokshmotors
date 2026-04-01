import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle } from './src/modules/vehicles/entities/vehicle.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const repo = app.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));

  const vehicles = await repo.find();
  console.log(`Found ${vehicles.length} vehicles.`);

  for (const v of vehicles) {
    let updated = false;
    
    // Fallback logic to populate new fields if they are null
    if (!v.make_en || !v.make_ar) {
        // Try to guess from existing data or set defaults for common luxury cars seen in UI
        if (v.details?.engine?.includes('Aventador') || v.sale_price > 20000000) {
            v.make_en = 'Lamborghini';
            v.make_ar = 'لامبورجيني';
            v.model_en = 'Aventador SVJ';
            v.model_ar = 'أفنتادور SVJ';
            updated = true;
        } else if (v.sale_price > 10000000) {
            v.make_en = 'Porsche';
            v.make_ar = 'بورش';
            v.model_en = 'Panamera Turbo';
            v.model_ar = 'باناميرا تيربو';
            updated = true;
        } else {
            // Default generic update for others
            v.make_en = v.make_en || 'Luxury Car';
            v.make_ar = v.make_ar || 'سيارة فاخرة';
            v.model_en = v.model_en || 'Premium Edition';
            v.model_ar = v.model_ar || 'إصدار فاخر';
            updated = true;
        }
    }

    if (updated) {
        await repo.save(v);
        console.log(`Updated vehicle: ${v.id}`);
    }
  }

  await app.close();
  console.log('Migration complete.');
}
bootstrap();
