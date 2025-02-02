import { User } from 'next-auth';
import { SidebarProvider, Sidebar, SidebarContent, SidebarInset, SidebarFooter } from '@/components/ui/sidebar';
import { SidebarHistory } from '@/components/sidebar/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar/sidebar-user-nav';
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
          {user && (
            <SidebarFooter>
              <SidebarUserNav user={user} />
            </SidebarFooter>
          )}
        </Sidebar>
        <SidebarInset className="flex-1">
          <div className="flex h-screen w-full flex-col items-center">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
} 