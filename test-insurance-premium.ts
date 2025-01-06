import { InsuranceService } from './services/insurance.service';

const service = new InsuranceService();
const premium = service.calculateRCPremium(1, 10, 'gasoline', 5, 1500);
console.log('RC Premium:', premium);
