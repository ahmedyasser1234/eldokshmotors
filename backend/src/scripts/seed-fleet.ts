import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Vehicle } from '../modules/vehicles/entities/vehicle.entity';
import { Repository } from 'typeorm';
import { VehicleCategory, VehicleStatus } from '../common/enums/index';

const fleet = [
  {
    make_ar: 'مرسيدس-بنز',
    make_en: 'Mercedes-Benz',
    model_ar: 'جي 63 ايه ام جي',
    model_en: 'G63 AMG',
    year: 2024,
    category: VehicleCategory.SUV,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 1500,
    sale_price: 250000,
    description_ar: 'مارسيدس جي 63 ايه ام جي هي أيقونة الفخامة والقوة، تتميز بمحرك V8 قوي وتصميم خارجي كلاسيكي مع مقصورة داخلية فائقة الحداثة.',
    description_en: 'The Mercedes-Benz G63 AMG is an icon of luxury and power, featuring a potent V8 engine and a classic exterior design with an ultra-modern interior.',
    image_urls: ['/g63.png'],
    details: {
      engine: '4.0L V8 Biturbo',
      hp: 577,
      transmission: '9-speed automatic',
      acceleration: '4.5s (0-100 km/h)',
    },
  },
  {
    make_ar: 'رولز-رويس',
    make_en: 'Rolls-Royce',
    model_ar: 'جوست',
    model_en: 'Ghost',
    year: 2024,
    category: VehicleCategory.LUXURY,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 3500,
    sale_price: 450000,
    description_ar: 'رولز رويس جوست تجسد قمة الرفاهية والهدوء على الطريق، بفضل محركها المكون من 12 أسطوانة ونظام التعليق الذي يشعرك كأنك فوق سحابة.',
    description_en: 'The Rolls-Royce Ghost embodies the pinnacle of luxury and serenity on the road, powered by a V12 engine and a suspension that feels like floating on a cloud.',
    image_urls: ['/ghost.png'],
    details: {
      engine: '6.75L V12',
      hp: 563,
      transmission: '8-speed automatic',
      acceleration: '4.8s (0-100 km/h)',
    },
  },
  {
    make_ar: 'بنتلي',
    make_en: 'Bentley',
    model_ar: 'بينتايجا',
    model_en: 'Bentayga',
    year: 2024,
    category: VehicleCategory.SUV,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 2200,
    sale_price: 320000,
    description_ar: 'بينتلي بينتايجا هي سيارة الدفع الرباعي الفاخرة الأسرع والأكثر رقيًا، تجمع بين الحرفية البريطانية التقليدية والأداء الرياضي المذهل.',
    description_en: 'The Bentley Bentayga is the fastest and most refined luxury SUV, combining traditional British craftsmanship with breathtaking performance.',
    image_urls: ['/bentayga.png'],
    details: {
      engine: '4.0L V8',
      hp: 542,
      transmission: '8-speed automatic',
      acceleration: '4.4s (0-100 km/h)',
    },
  },
  {
    make_ar: 'بورشه',
    make_en: 'Porsche',
    model_ar: '911 تيربو اس',
    model_en: '911 Turbo S',
    year: 2024,
    category: VehicleCategory.SPORT,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 2500,
    sale_price: 280000,
    description_ar: 'بورشه 911 تيربو اس هي تعريف السيارة الرياضية الفائقة، تقدم أداءاً مذهلاً على الحلبة وراحة لا مثيل لها في القيادة اليومية.',
    description_en: 'The Porsche 911 Turbo S is the definition of a supercar, offering mind-bending track performance and daily usability.',
    image_urls: ['/porsche911.png'],
    details: {
      engine: '3.8L Flat-6 Twin-Turbo',
      hp: 640,
      transmission: '8-speed PDK',
      acceleration: '2.7s (0-100 km/h)',
    },
  },
  {
    make_ar: 'أودي',
    make_en: 'Audi',
    model_ar: 'ار اس كيو 8',
    model_en: 'RS Q8',
    year: 2024,
    category: VehicleCategory.SPORT,
    status: VehicleStatus.AVAILABLE,
    rent_price_per_day: 1800,
    sale_price: 210000,
    description_ar: 'أودي RS Q8 هي أقوى سيارة دفع رباعي من أودي سبورت، تجمع بين قوة السيارات الخارقة وعملية سيارات الدفع الرباعي العائلية.',
    description_en: 'The Audi RS Q8 is the most powerful SUV from Audi Sport, combining supercar power with the practicality of a family SUV.',
    image_urls: ['/rsq8.png'],
    details: {
      engine: '4.0L V8 Twin-Turbo',
      hp: 591,
      transmission: '8-speed automatic',
      acceleration: '3.8s (0-100 km/h)',
    },
  },
];

async function bootstrap() {
  console.log('Starting fleet seeding...');
  const app = await NestFactory.createApplicationContext(AppModule);
  console.log('App context created');
  const repo = app.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));

  for (const vehicleData of fleet) {
    const existing = await repo.findOne({
      where: { make_en: vehicleData.make_en, model_en: vehicleData.model_en, year: vehicleData.year }
    });

    if (!existing) {
      const vehicle = repo.create(vehicleData as any);
      await repo.save(vehicle);
      console.log(`Added: ${vehicleData.make_en} ${vehicleData.model_en}`);
    } else {
      console.log(`Skipping (already exists): ${vehicleData.make_en} ${vehicleData.model_en}`);
    }
  }

  await app.close();
  console.log('Seeding complete.');
}

bootstrap().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
