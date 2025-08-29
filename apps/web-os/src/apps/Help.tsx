import React from 'react'

export function Help(){
  return (
    <div className="p-4 space-y-4 text-sm">
      <h2 className="font-bold text-base">Welcome to nostalgiOS</h2>
      <ul className="list-disc pl-5 space-y-1">
        <li>Left-click empty desktop → System Menu. Right-click items → context actions.</li>
        <li>Use the Dock on the right to launch apps.</li>
        <li>Settings → Appearance & Desktop to change theme and wallpaper.</li>
        <li>Cloud lets you backup/restore your state (encrypted) to the server.</li>
      </ul>
      <h3 className="font-bold">Need help?</h3>
      <p>Open Notes → HELP.txt for tips, or ping Support (this window).</p>
    </div>
  )
}
