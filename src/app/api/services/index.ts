export { api } from "./api.service";
export { BaseCrudService } from "./base-crud.service";
export { authService } from "./auth.service";
export { connectSocket, disconnectSocket, getSocket, onceConnected } from "./socket.service";
export { pushService } from "./push.service";
export { notificationsService } from "./notifications.service";

// Serviço de Clients
export { clientsService } from "./clients.service";
// Serviço de Delivery Prices
export { deliveryPricesService } from "./prices/delivery.service";
// Serviço de Product Prices
export { productsService } from "./prices/products.service";
// Serviço de Stock
export { stockService } from "./stock.service";
// Serviço de Appointments
export { appointmentsService } from "./appointments.service";
// Servico de Containers
export { containersServices } from "./containers.service";
// Serviço de Funcionários - Usuários (RH)
export { usersService } from "./hr/users.service";
// Serviço de Configurações da Empresa
export { configurationsService } from "./configurations.service";
// Serviço de Driver App
export { driverAppService } from "./driver-service-order/driver-app.service";
// Serviço de Service Order Form
export { serviceOrderFormService } from "./driver-service-order/service-order-form.service";
export type { OrdemServicoView } from "./driver-service-order/service-order-form.service";