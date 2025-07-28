import { PrismaService } from '../common/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export interface UserQueryParams {
    search?: string;
    roleId?: number;
    isActive?: boolean;
    orderBy?: string;
}
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(page?: number, pageSize?: number, params?: UserQueryParams): Promise<{
        data: {
            role: import("@prisma/client/runtime").GetResult<{
                id: number;
                name: string;
                description: string | null;
            }, unknown> & {};
            id: number;
            username: string;
            fullName: string;
            phone: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            roleId: number;
        }[];
        pagination: {
            page: number;
            pageSize: number;
            total: number;
            totalPages: number;
        };
    }>;
    findById(id: number): Promise<{
        role: import("@prisma/client/runtime").GetResult<{
            id: number;
            name: string;
            description: string | null;
        }, unknown> & {};
        id: number;
        username: string;
        fullName: string;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        roleId: number;
    }>;
    getUserStatistics(id: number): Promise<{
        viewingRecordsCount: number;
        apiKeysCount: number;
    }>;
    findByUsername(username: string): Promise<{
        role: import("@prisma/client/runtime").GetResult<{
            id: number;
            name: string;
            description: string | null;
        }, unknown> & {};
    } & import("@prisma/client/runtime").GetResult<{
        id: number;
        username: string;
        password: string;
        fullName: string | null;
        phone: string | null;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        roleId: number;
    }, unknown> & {}>;
    create(createUserDto: CreateUserDto): Promise<{
        role: import("@prisma/client/runtime").GetResult<{
            id: number;
            name: string;
            description: string | null;
        }, unknown> & {};
        id: number;
        username: string;
        fullName: string;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        roleId: number;
    }>;
    update(id: number, updateUserDto: UpdateUserDto): Promise<{
        role: import("@prisma/client/runtime").GetResult<{
            id: number;
            name: string;
            description: string | null;
        }, unknown> & {};
        id: number;
        username: string;
        fullName: string;
        phone: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        roleId: number;
    }>;
    batchUpdate(ids: number[], updateData: Partial<UpdateUserDto>): Promise<{
        message: string;
        updatedCount: number;
    }>;
    resetPassword(id: number): Promise<{
        message: string;
        tempPassword: string;
    }>;
    batchDelete(ids: number[]): Promise<{
        message: string;
        deletedCount: number;
    }>;
    remove(id: number): Promise<{
        message: string;
    }>;
    private generateTempPassword;
}
