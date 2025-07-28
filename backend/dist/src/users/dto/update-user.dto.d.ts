import { CreateUserDto } from './create-user.dto';
declare const UpdateUserDto_base: import("@nestjs/mapped-types").MappedType<Partial<CreateUserDto>>;
export declare class UpdateUserDto extends UpdateUserDto_base {
    username?: string;
    password?: string;
    fullName?: string;
    phone?: string;
    roleId?: number;
    isActive?: boolean;
}
export {};
