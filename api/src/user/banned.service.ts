import { Repository } from 'typeorm';
import { Injectable } from "@nestjs/common";
import { BannedEntity } from './entities/banned.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class BannedService {
	constructor(@InjectRepository(BannedEntity)
		private readonly bannedRepository: Repository<BannedEntity>
	) {}
	
	async banUser(id: number) {
		const query = await this.bannedRepository
		.createQueryBuilder('banned_entity')
		.where('banned_entity.banId = :id', { id })
		.getOne();
		if (!query) {
			const banId = await this.bannedRepository.create({ banId: id });
			await this.bannedRepository.save(banId);
		}
	}

	async isBan(id: number): Promise<boolean> {
		const banId = await this.bannedRepository.findOne( { banId: id });
		if (!banId) {
			return false;
		} else {
			return true;
		}
	}

	async unbanUser(id: number): Promise<void> {
		const banId = await this.bannedRepository.findOne( { banId: id });
		if (banId) {
			await this.bannedRepository.delete(banId);
		}
	}


}