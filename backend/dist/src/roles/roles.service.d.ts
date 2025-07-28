import { PrismaService } from '../common/prisma/prisma.service';
export declare class RolesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        success: boolean;
        data: {
            id: number;
            name: string;
            description: string;
        }[];
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: {
            id: number;
            name: string;
            description: string;
        };
    }>;
}
