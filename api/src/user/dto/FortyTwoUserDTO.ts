import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class fortyTwoUserDTO {

    @ApiProperty()
    @IsString()
    username: string;

    @ApiProperty()
    @IsNumber()
    id: number;

    @ApiProperty()
    @IsString()
    avatar?: string;
}
