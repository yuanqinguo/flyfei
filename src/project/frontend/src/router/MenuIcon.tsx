import Icon, {
  BookOutlined,
  ContainerOutlined,
  InboxOutlined,
  ProfileOutlined,
  ReadOutlined,
  SettingOutlined,
  TagsOutlined,
  UserOutlined,
  HddOutlined,
  FormOutlined,
  DatabaseOutlined,
  FundViewOutlined,
  BarChartOutlined,
  ContactsOutlined,
  SoundOutlined,
  VideoCameraOutlined,
  FileOutlined,
  GoldOutlined,
  AccountBookOutlined,
  ShoppingOutlined,
  TeamOutlined,
  AuditOutlined
} from '@ant-design/icons'
import DeepSeekSvg from '@/assets/icons/DeepSeek.svg?react'

const MenuIcon: Record<string, React.ReactNode> = {
  contents: <ProfileOutlined />,
  label: <TagsOutlined />,
  'ques-manage': <ContainerOutlined />,
  system: <SettingOutlined />,
  'user-manage': <UserOutlined />,
  bank: <DatabaseOutlined />,
  'resource-manage': <InboxOutlined />,
  'paper-manage': <ReadOutlined />,
  'basic-info': <HddOutlined />,
  feedback: <FormOutlined />,
  book: <BookOutlined />,
  course: <VideoCameraOutlined />,
  qa: <Icon component={DeepSeekSvg} />,
  report: <BarChartOutlined />,
  tenant: <ContactsOutlined />,
  operation: <SoundOutlined />,
  'prepare-center': <FileOutlined />,
  'knowledge-content-manage': <GoldOutlined />,
  'goods-manage': <ShoppingOutlined />,
  'order-manage': <AccountBookOutlined />,
  'class-manage': <TeamOutlined />,
  'channel-manage': <AuditOutlined />
}

export default MenuIcon
