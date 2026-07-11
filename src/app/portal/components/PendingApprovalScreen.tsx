import SignOutButton from './SignOutButton'

interface Props {
  email: string
  name?: string
}

export default function PendingApprovalScreen({ email, name }: Props) {
  return (
    <div className="min-h-screen bg-[#0E0E0E] text-white font-body flex flex-col items-center justify-center px-6 py-16">
      <div className="max-w-lg w-full border-4 border-white p-8 md:p-12 bg-[#0E0E0E]">
        <p className="font-label uppercase tracking-widest text-xs text-[#D83C14] mb-4">
          NYX Studio · Client Portal
        </p>

        <h1 className="font-headline font-black text-4xl md:text-5xl uppercase leading-[0.95] tracking-tighter mb-6">
          You&rsquo;re on the list <span className="text-[#D83C14]">✦</span>
        </h1>

        <p className="text-base text-white/80 leading-relaxed mb-3">
          Your access request has been received. NYX Studio will review and approve
          your account shortly. You&rsquo;ll receive an email once you&rsquo;re approved.
        </p>

        <div className="my-8 border-t border-white/20 pt-6">
          <p className="font-label uppercase tracking-wider text-xs text-white/50 mb-2">
            Signed in as
          </p>
          {name && (
            <p className="font-headline text-xl font-bold mb-0.5">{name}</p>
          )}
          <p className="text-sm text-white/70">{email}</p>
        </div>

        <SignOutButton variant="dark" />
      </div>

      <p className="mt-8 text-xs text-white/40 font-label uppercase tracking-wider">
        Need help? Email{' '}
        <a
          href="mailto:official.nyxstudio@gmail.com"
          className="text-[#D83C14] hover:underline"
        >
          official.nyxstudio@gmail.com
        </a>
      </p>
    </div>
  )
}
