// TypeScript types for publish route

export type SourceType = 'google_drive' | 'heygen' | 'local_upload';

export interface HeygenOptions {
  avatarId?: string;
  voiceId?: string;
  language?: string;
  aspectRatio?: string; // e.g. '9:16' or '16:9'
}

export interface ContentBrief {
  title: string;
  description?: string;
  audience?: string;
  objective?: 'educate' | 'promote' | 'engage' | 'contact';
  cta?: string;
  tags?: string[];
}

export interface ChannelPayload {
  title?: string;
  description?: string;
  hashtags?: string[];
  privacy?: 'public' | 'private' | 'unlisted';
  hook?: string;
  caption?: string;
  cta?: string;
  text?: string;
}

export interface AIResponse {
  meta: Record<string, any>;
  channels: Record<string, ChannelPayload>;
  heygen?: {
    script?: string;
    scenes?: Array<{ start: number; end: number; text: string }>;
    suggestedAvatarId?: string;
    suggestedVoiceId?: string;
  };
}

export interface PublishFormState {
  sourceType: SourceType;
  googleDriveFileId?: string;
  localFileId?: string;
  heygenOptions?: HeygenOptions;
  brief: ContentBrief;
  channels: string[];
  schedule?: string | null;
  approved: boolean;
  dry_run: boolean;
}
