import { InsuranceService } from './insurance.service';

describe('InsuranceService', () => {
  let service: InsuranceService;

  beforeEach(() => {
    service = new InsuranceService();
  });

  test('calculateRCPremium for category 1, horsepower 10', () => {
    const premium = service.calculateRCPremium(1, 10, 'gasoline', 5, 1500);
    console.log('RC Premium:', premium);
    expect(premium).toBeGreaterThan(0);
  });

  test('calculateRCPremium for category 2, horsepower 10', () => {
    const premium = service.calculateRCPremium(2, 10, 'gasoline', 5, 1500, 'under3.5');
    console.log('RC Premium for commercial vehicle:', premium);
    expect(premium).toBeGreaterThan(0);
  });
});
