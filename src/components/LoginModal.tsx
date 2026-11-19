import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  ShieldCheck,
  KeyRound,
  Check,
  AlertCircle,
  LogIn,
  LogOut,
  Users,
  Briefcase,
  Phone,
  Mail,
  MapPin,
  Clock,
  Eye,
  EyeOff
} from 'lucide-react';
import {
  AuthUser,
  EngineerProfile,
  StaffRole,
  AdminTabType,
  formatShortStaffName
} from '../types';
import { DEFAULT_ADMIN_USER, DEFAULT_ACCOUNT_PASSWORD, getDefaultTabsForRole } from '../utils/storage';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: AuthUser | null;
  engineers: EngineerProfile[];
  onLogin: (user: AuthUser, rememberMe?: boolean) => void;
  onLogout: () => void;
  initialRememberMe?: boolean;
}

const TAB_SHORT_LABELS: Record<string, string> = {
  create_ticket: 'Tạo Phiếu',
  bulletins: 'Bản Tin ADC',
  dispatch: 'Bảng việc',
  sop_mgmt: 'Kho SOP',
  records: 'Sổ Tay XLKT',
  staff: 'Nhân Sự',
  analytics: 'Báo Cáo SLA',
  chatbot_analytics: 'Chatbot NLP',
  learning: 'Tự Học AI',
  settings: 'Cài Đặt',
  excel: 'Xuất/Nhập'
};

const getRoleDisplay = (role: StaffRole, dept?: string) => {
  switch (role) {
    case 'director':
      return {
        title: 'Giám đốc',
        dept: dept || 'Ban Giám Đốc',
        badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
        icon: '👑'
      };
    case 'css':
      return {
        title: 'Phòng CSS',
        dept: dept || 'Phòng CSS',
        badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300',
        icon: '🎧'
      };
    case 'warehouse':
      return {
        title: 'Kho vận',
        dept: dept || 'Bộ Phận Kho',
        badgeClass: 'bg-orange-100 text-orange-900 border-orange-300',
        icon: '📦'
      };
    case 'sales':
      return {
        title: 'Kinh doanh',
        dept: dept || 'Phòng Kinh Doanh',
        badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
        icon: '💼'
      };
    case 'field_engineer':
    default:
      return {
        title: 'Kỹ thuật',
        dept: dept || 'Phòng Kỹ Thuật',
        badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
        icon: '🔧'
      };
  }
};

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  engineers,
  onLogin,
  onLogout,
  initialRememberMe = false
}) => {
  const [activeTab, setActiveTab] = useState<'quick' | 'form'>('form');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(initialRememberMe);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setRememberMe(Boolean(initialRememberMe));
      setErrorMessage('');
      setSuccessMessage('');
      setShowPassword(false);
    }
  }, [isOpen, initialRememberMe]);

  if (!isOpen) return null;

  const completeEngineerLogin = (eng: EngineerProfile) => {
    const roleInfo = getRoleDisplay(eng.role, eng.department);
    const baseTabs = (eng.allowedTabs && eng.allowedTabs.length > 0)
      ? eng.allowedTabs
      : getDefaultTabsForRole(eng.role);
    const resolvedAllowedTabs: AdminTabType[] = baseTabs.includes('dispatch') ? baseTabs : ['dispatch', ...baseTabs];

    const authUser: AuthUser = {
      id: eng.id,
      name: eng.name,
      username: eng.username || eng.email.split('@')[0],
      role: eng.role,
      roleTitle: roleInfo.title,
      department: eng.department || roleInfo.dept,
      phone: eng.phone,
      email: eng.email,
      avatar: eng.name.split(' ').slice(-1)[0],
      area: eng.area,
      allowedTabs: resolvedAllowedTabs,
      loginTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay'
    };
    onLogin(authUser, rememberMe);
    setSuccessMessage(`Đăng nhập thành công: ${eng.name} (${roleInfo.title})!`);
    setPassword('');
    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 500);
  };

  const handleSelectStaffForForm = (eng: EngineerProfile) => {
    const hasDuplicateUsername = Boolean(eng.username) && engineers.filter(
      other => other.username && other.username.toLowerCase() === eng.username!.toLowerCase()
    ).length > 1;
    const resolvedUsername = (!hasDuplicateUsername && eng.username)
      ? eng.username
      : (eng.email || eng.phone);
    setUsername(resolvedUsername);
    setPassword('');
    setErrorMessage('');
    setSuccessMessage(`Đã chọn tài khoản ${eng.name} (${resolvedUsername}). Vui lòng nhập mật khẩu để đăng nhập.`);
    setActiveTab('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const rawInput = username.trim();
    const q = rawInput.toLowerCase();
    const normalizedPhone = q.replace(/\s+/g, '');

    if (!rawInput || !password.trim()) {
      setErrorMessage('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }

    if (q === 'giamdoc' || q === 'director') {
      const directorAccount = engineers.find(e => e.role === 'director');
      const expectedPassword = directorAccount?.password?.trim() || DEFAULT_ACCOUNT_PASSWORD;
      if (password !== expectedPassword) {
        setErrorMessage('Mật khẩu không chính xác. Vui lòng kiểm tra lại.');
        return;
      }
      if (directorAccount) {
        completeEngineerLogin(directorAccount);
      } else {
        onLogin({
          ...DEFAULT_ADMIN_USER,
          loginTime: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay'
        }, rememberMe);
        onClose();
      }
      return;
    }

    // Check exact match in registered staff directory
    const exactMatched = engineers.find(eng => {
      const emailLower = (eng.email || '').toLowerCase();
      const emailUser = emailLower.split('@')[0];
      return (
        (eng.username && eng.username.toLowerCase() === q) ||
        (emailLower && emailLower === q) ||
        (emailUser && emailUser === q) ||
        eng.phone.replace(/\s+/g, '').toLowerCase() === normalizedPhone ||
        eng.name.toLowerCase() === q
      );
    });

    if (!exactMatched) {
      setErrorMessage('Tên đăng nhập không tồn tại trong danh sách nhân sự.');
      return;
    }

    const expectedPassword = exactMatched.password?.trim() || DEFAULT_ACCOUNT_PASSWORD;
    if (password !== expectedPassword) {
      setErrorMessage('Mật khẩu không chính xác. Vui lòng kiểm tra lại.');
      return;
    }

    completeEngineerLogin(exactMatched);
  };

  const handleLogoutClick = () => {
    onLogout();
    setUsername('');
    setPassword('');
    setRememberMe(false);
    setSuccessMessage('Đã đăng xuất thành công khỏi hệ thống!');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 z-10 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header Bar */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-slate-900 text-white shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Tài Khoản & Đăng Nhập Hệ Thống ADC
                </h3>
                <p className="text-xs text-emerald-300 font-medium">
                  Cổng Quản Trị, Phân Công & Điều Phối Kỹ Sư 24/7
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 space-y-4 text-xs sm:text-sm overflow-y-auto flex-1 min-h-0">
          
          {/* Notification Messages */}
          {successMessage && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="bg-red-50 border border-red-300 text-red-800 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* If currently logged in, show comprehensive session information */}
          {currentUser ? (
            <div className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-200/80">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-700 text-white flex items-center justify-center text-base font-bold shadow-xs">
                      {currentUser.avatar || 'ADC'}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>{currentUser.name}</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      </h4>
                      <p className="text-xs font-semibold text-emerald-800">
                        {currentUser.roleTitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-emerald-200/80 text-emerald-950 px-2.5 py-1 rounded-full">
                    ĐÃ ĐĂNG NHẬP
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-700">
                  <div className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-emerald-100">
                    <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>SĐT:</strong> {currentUser.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-emerald-100">
                    <Mail className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span className="truncate"><strong>Email:</strong> {currentUser.email}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-emerald-100">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Khu vực:</strong> {currentUser.area}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/80 p-2 rounded-lg border border-emerald-100">
                    <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Phiên:</strong> {currentUser.loginTime}</span>
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={handleLogoutClick}
                  className="w-full py-2.5 px-4 bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 border border-red-200 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-2xs"
                >
                  <LogOut className="w-4 h-4 text-red-600" />
                  <span>Đăng Xuất Khỏi Tài Khoản Này</span>
                </button>

                <p className="text-[11px] text-slate-500 text-center">
                  Hoặc bạn có thể chọn một tài khoản kỹ sư khác bên dưới để chuyển đổi phiên làm việc:
                </p>
              </div>
            </div>
          ) : (
            /* Logged Out State View */
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center space-y-1">
              <p className="font-bold text-slate-800 text-xs sm:text-sm">
                Bạn chưa đăng nhập vào hệ thống quản trị ADC
              </p>
              <p className="text-slate-500 text-xs">
                Vui lòng đăng nhập bằng tài khoản Giám đốc, Phòng CSS, Kho vận, Kinh doanh hoặc Kỹ thuật.
              </p>
            </div>
          )}

          {/* Quick Select Account or Form Toggle */}
          <div className="pt-2">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2 mb-2">
              <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-emerald-600" />
                <span>Chọn tài khoản theo Phòng Ban:</span>
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px] font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setActiveTab('form');
                  }}
                  className={`px-2.5 py-0.5 rounded cursor-pointer transition-colors ${
                    activeTab === 'form' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Đăng nhập
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setActiveTab('quick');
                  }}
                  className={`px-2.5 py-0.5 rounded cursor-pointer transition-colors ${
                    activeTab === 'quick' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  Chọn nhân sự
                </button>
              </div>
            </div>

            {/* Department Quick Filter */}
            {activeTab === 'quick' && (
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-2 mb-2">
                {[
                  { id: 'all', label: 'Tất cả' },
                  { id: 'director', label: '👑 Giám đốc' },
                  { id: 'css', label: '🎧 Phòng CSS' },
                  { id: 'warehouse', label: '📦 Kho vận' },
                  { id: 'sales', label: '💼 Kinh doanh' },
                  { id: 'field_engineer', label: '🔧 Kỹ thuật' }
                ].map(dept => (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => setDepartmentFilter(dept.id)}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-medium whitespace-nowrap cursor-pointer transition-colors ${
                      departmentFilter === dept.id
                        ? 'bg-emerald-700 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                    }`}
                  >
                    {dept.label}
                  </button>
                ))}
              </div>
            )}

            {activeTab === 'quick' ? (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {/* Registered Staff and Department Accounts */}
                {engineers
                  .filter(eng => {
                    if (departmentFilter === 'all') return true;
                    return eng.role === departmentFilter;
                  })
                  .map(eng => {
                    const isCurrent = currentUser?.id === eng.id;
                    const roleInfo = getRoleDisplay(eng.role, eng.department);
  const baseUserTabs = (eng.allowedTabs && eng.allowedTabs.length > 0)
    ? eng.allowedTabs
    : getDefaultTabsForRole(eng.role);
  const userTabs = baseUserTabs.includes('dispatch') ? baseUserTabs : (['dispatch', ...baseUserTabs] as AdminTabType[]);

                    return (
                      <button
                        key={eng.id}
                        type="button"
                        onClick={() => handleSelectStaffForForm(eng)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex flex-col gap-1.5 cursor-pointer group ${
                          isCurrent 
                            ? 'border-emerald-500 bg-emerald-100/50 shadow-2xs' 
                            : 'border-slate-200 bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0">
                              {roleInfo.icon}
                            </div>
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-bold text-xs text-slate-900 leading-tight">
                                  {formatShortStaffName(eng.name)} <span className="font-normal text-[11px] text-slate-500">({eng.name})</span>
                                </p>
                                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleInfo.badgeClass}`}>
                                  {eng.department || roleInfo.dept}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-600 font-medium">
                                {roleInfo.title}
                              </p>
                              <p className="text-[10px] text-slate-400">
                                SĐT: {eng.phone} · Khu vực: {eng.area}
                              </p>
                            </div>
                          </div>
                          <span className={`text-[11px] font-semibold shrink-0 ${
                            isCurrent ? 'text-emerald-700 font-bold' : 'text-slate-500 group-hover:text-emerald-700'
                          }`}>
                            {isCurrent ? 'Đang dùng ●' : 'Chọn tài khoản →'}
                          </span>
                        </div>

                        {/* Checklist Allowed Tabs Preview */}
                        <div className="flex items-center gap-1 flex-wrap pt-1 border-t border-slate-100">
                          <span className="text-[10px] font-bold text-slate-500">
                            Checklist ({userTabs.length} tab):
                          </span>
                          {userTabs.map(tabKey => (
                            <span
                              key={tabKey}
                              className={`text-[9px] font-semibold px-1.5 py-0.2 rounded border ${
                                eng.role === 'sales'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                                  : 'bg-slate-50 text-slate-700 border-slate-200'
                              }`}
                            >
                              {TAB_SHORT_LABELS[tabKey] || tabKey}
                            </span>
                          ))}
                        </div>
                      </button>
                    );
                  })}
              </div>
            ) : (
              /* Tab Form: Username & Password */
              <form onSubmit={handleFormSubmit} className="space-y-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Tên đăng nhập hoặc Email nhân sự:
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập tên đăng nhập (VD: tung, dat.nq)"
                    autoComplete="username"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    Mật khẩu truy cập:
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Nhập mật khẩu"
                      autoComplete="current-password"
                      className="w-full pl-3 pr-9 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(prev => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <label className="flex items-start gap-2 pt-0.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 accent-emerald-600 cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-slate-700 leading-snug">
                    <strong className="font-semibold text-slate-900">Ghi nhớ đăng nhập</strong>
                    <span className="block text-[11px] text-slate-500">
                      Tự động lưu phiên để lần sau mở phần mềm vào nhanh cổng quản trị
                    </span>
                  </span>
                </label>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Xác Nhận Đăng Nhập</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>ADC Medical Tech · Bảo mật nội bộ</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 text-slate-600 hover:text-slate-900 font-semibold cursor-pointer"
          >
            {currentUser ? 'Đóng' : 'Xem Cổng Khách Hàng'}
          </button>
        </div>

      </div>
    </div>
  );
};
