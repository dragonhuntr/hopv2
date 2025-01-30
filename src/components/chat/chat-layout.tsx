import { User } from 'next-auth';
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset } from '@/components/ui/sidebar';
import { SidebarHistory } from '@/components/chat/sidebar-history';
import { ReactNode } from 'react';

interface ChatLayoutProps {
  children: ReactNode;
  user: User | undefined;
  defaultOpen?: boolean;
}

export function ChatLayout({ children, user, defaultOpen = true }: ChatLayoutProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarContent>
            <SidebarHistory user={user} />
          </SidebarContent>
        </Sidebar>
        <SidebarInset className="flex-1">
          <div className="flex h-screen w-full flex-col">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 