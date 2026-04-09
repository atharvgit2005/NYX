import VoiceCloner from '@/components/VoiceCloner';
import VoiceTester from '@/components/VoiceTester';

export default function AvatarPage() {
    return (
        <div className="space-y-12 pb-12">
            <div>
                <VoiceCloner />
            </div>

            <div className="border-t border-theme pt-8">
                <VoiceTester />
            </div>
        </div>
    );
}
