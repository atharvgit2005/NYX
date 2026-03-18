import AvatarUpload from '@/components/AvatarUpload';
import VoiceCloner from '@/components/VoiceCloner';
import VoiceTester from '@/components/VoiceTester';

export default function AvatarPage() {
    return (
        <div className="space-y-12 pb-12">
            <AvatarUpload />

            <div className="border-t border-theme pt-8">
                <VoiceCloner />
            </div>

            <div className="border-t border-theme pt-8">
                <VoiceTester />
            </div>
        </div>
    );
}
