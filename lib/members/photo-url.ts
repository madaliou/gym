export function memberPhotoPath(memberId: string) {
  return `/api/members/${memberId}/photo`;
}

export function memberPhotoDisplayUrl(member: {
  id: string;
  photoUrl: string | null;
  photoMime?: string | null;
}) {
  if (member.photoUrl) {
    return member.photoUrl;
  }

  if (member.photoMime) {
    return memberPhotoPath(member.id);
  }

  return null;
}
