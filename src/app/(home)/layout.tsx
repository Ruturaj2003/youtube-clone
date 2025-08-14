import { HomeLayout } from "@/modules/home/ui/home-layout";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return <HomeLayout>aassad{children}</HomeLayout>;
};

export default Layout;
