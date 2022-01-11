export default interface PartialUserI {
	id: number;
	username: string;
	avatar: string;
	ratio: number;
	victories: number;
	losses: number;
	friends: number[];
	achievements: boolean[];
}