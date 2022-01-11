import { UserStatus } from './../entities/user.entity';
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class publicUserDTO {
    @ApiProperty()
    @IsNumber()
    id: number;

    @ApiProperty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsString()
    avatar?: string;

    @ApiProperty()
    status: UserStatus;

    @ApiProperty()
    @IsNumber()
    victories: number;

    @ApiProperty()
    @IsNumber()
    losses: number;

    @ApiProperty()
    @IsNumber()
    ratio: number;

    @ApiProperty()
    @IsString()
    achievements: string;

}