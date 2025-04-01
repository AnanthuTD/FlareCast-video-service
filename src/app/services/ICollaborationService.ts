export interface ICollaborationService {
  isSpaceMember(spaceId: string, userId: string): Promise<boolean | null>;
}