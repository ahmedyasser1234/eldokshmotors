import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { VehiclesService } from './src/modules/vehicles/vehicles.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const vehiclesService = app.get(VehiclesService);

  console.log('--- ALL VEHICLES ---');
  const all = await vehiclesService.findAll({});
  console.log(JSON.stringify(all, null, 2));

  console.log('--- SEARCH: Porsche ---');
  const searchResult = await vehiclesService.findAll({ search: 'Porsche' });
  console.log(JSON.stringify(searchResult, null, 2));

  await app.close();
}
bootstrap();
