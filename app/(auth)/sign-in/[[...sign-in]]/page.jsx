import { SignIn } from '@clerk/nextjs'

export default function Page() {
  return (
    <div className="flex h-screen w-full">

      {/* Left: decorative image */}
      <div className="w-full hidden md:inline-block">
        <img
          className="h-full w-full object-cover"
          src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/leftSideImage.png"
          alt="leftSideImage"
        />
      </div>

      {/* Right: Clerk sign-in */}
      <div className="w-full flex flex-col items-center justify-center">
        <SignIn />
      </div>

    </div>
  )
}