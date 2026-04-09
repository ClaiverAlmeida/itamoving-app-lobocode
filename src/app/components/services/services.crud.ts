import { mockLeads } from "./services.mock";
import type { Lead } from "./services.types";

export const servicesCrud = {
  async getAll(): Promise<{ success: boolean; data: Lead[] }> {
    return { success: true, data: [...mockLeads] };
  },
};

