import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Printer,
  BedDouble,
  Phone,
  Calendar,
  CheckCircle2,
  Trash2,
  UserPlus,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { FamilyGroup, Pilgrim, Program } from '../types';

interface FamiliesGroupsViewProps {
  groups: FamilyGroup[];
  pilgrims: Pilgrim[];
  programs: Program[];
  onCreateGroup: (group: FamilyGroup) => void;
  onDeleteGroup: (id: string) => void;
}

export const FamiliesGroupsView: React.FC<FamiliesGroupsViewProps> = ({
  groups,
  pilgrims,
  programs,
  onCreateGroup,
  onDeleteGroup,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProgramFilter, setSelectedProgramFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Group Form State
  const [groupName, setGroupName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderPhone, setLeaderPhone] = useState('');
  const [selectedProgramId, setSelectedProgramId] = useState(programs[0]?.id || '');
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [roomPref, setRoomPref] = useState<'خماسية' | 'رباعية' | 'ثلاثية' | 'ثنائية' | 'فردية'>('رباعية');
  const [groupNotes, setGroupNotes] = useState('');

  const filteredGroups = groups.filter(g => {
    const matchesSearch = g.groupName.includes(searchTerm) || g.leaderName.includes(searchTerm) || g.leaderPhone.includes(searchTerm);
    const matchesProg = selectedProgramFilter === 'all' || g.programId === selectedProgramFilter;
    return matchesSearch && matchesProg;
  });

  const availablePilgrims = pilgrims.filter(p => !p.inCorbeille && (selectedProgramId ? p.programId === selectedProgramId : true));

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || !leaderName) return;

    const prog = programs.find(p => p.id === selectedProgramId);

    const newGrp: FamilyGroup = {
      id: `grp-${Date.now()}`,
      groupName,
      leaderName,
      leaderPhone,
      programId: selectedProgramId,
      programName: prog?.name || 'برنامج عمرة',
      memberIds: selectedMemberIds,
      roomPreference: roomPref,
      totalMembers: selectedMemberIds.length > 0 ? selectedMemberIds.length : 1,
      notes: groupNotes,
    };

    onCreateGroup(newGrp);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setGroupName('');
    setLeaderName('');
    setLeaderPhone('');
    setSelectedMemberIds([]);
    setGroupNotes('');
  };

  const toggleMemberSelection = (pilgrimId: string) => {
    if (selectedMemberIds.includes(pilgrimId)) {
      setSelectedMemberIds(prev => prev.filter(id => id !== pilgrimId));
    } else {
      setSelectedMemberIds(prev => [...prev, pilgrimId]);
    }
  };

  const handlePrintGroup = (grp: FamilyGroup) => {
    const grpMembers = pilgrims.filter(p => grp.memberIds.includes(p.id));
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="utf-8" />
        <title>بيان مجموعة عائلية - ${grp.groupName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 25px; color: #111; }
          .header { text-align: center; border-bottom: 2px solid #1a4d41; padding-bottom: 15px; margin-bottom: 20px; }
          .header h1 { color: #1a4d41; margin: 0; font-size: 22px; }
          .header p { color: #666; font-size: 13px; margin-top: 5px; }
          .info-box { background: #f8faf9; border: 1px solid #dcdcdc; padding: 15px; border-radius: 8px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; font-size: 12px; }
          th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: right; }
          th { background: #1a4d41; color: white; }
          .footer { margin-top: 30px; text-align: left; font-size: 11px; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>وكالة زاد للسفر والسياحة - ZAD TRAVEL & TOURISM</h1>
          <p>بيان تفصيلي للمجموعة العائلية ورغبات التسكين الفندقي</p>
        </div>
        <div class="info-box">
          <div><strong>اسم المجموعة:</strong> ${grp.groupName}</div>
          <div><strong>رئيس المجموعة:</strong> ${grp.leaderName} (${grp.leaderPhone})</div>
          <div><strong>البرنامج:</strong> ${grp.programName}</div>
          <div><strong>نوع الغرفة المفضلة:</strong> ${grp.roomPreference}</div>
          <div><strong>عدد الأفراد:</strong> ${grpMembers.length} أفراد</div>
        </div>
        <h3>أفراد المجموعة المعينون:</h3>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>الاسم الكامل</th>
              <th>رقم الجواز</th>
              <th>الهاتف</th>
              <th>نوع الغرفة</th>
              <th>حالة التأشيرة</th>
            </tr>
          </thead>
          <tbody>
            ${grpMembers.map((m, idx) => `
              <tr>
                <td>${idx + 1}</td>
                <td>${m.fullName}</td>
                <td>${m.passportNumber}</td>
                <td>${m.phone}</td>
                <td>${m.roomType}</td>
                <td>${m.visaStatus}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="footer">
          تم التوليد بواسطة نظام زاد للسفر والسياحة - تاريخ الطباعة: ${new Date().toLocaleDateString('ar-MA')}
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-l from-[#003425] to-[#004d37] text-white p-6 rounded-2xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-[#00261b]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-[#E5B842]" />
            <h2 className="text-xl font-black font-['Alexandria',sans-serif]">
              إدارة العائلات والمجموعات العائلية
            </h2>
          </div>
          <p className="text-xs text-emerald-100/80">
            تجميع المعتمرين من نفس العائلة لتسهيل حجز الغرف المتصلة، الموزايك الفندقي، والنقل الجماعي.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#E5B842] hover:bg-[#d6a933] text-[#003425] font-extrabold px-4 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-md transition-all active:scale-95 border border-amber-200/60"
        >
          <UserPlus className="w-4 h-4 stroke-[3]" />
          <span>إنشاء مجموعة عائلية جديدة</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث باسم المجموعة أو مسؤول العائلة..."
            className="w-full pr-9 pl-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-[#003425]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">تصفية حسب الرحلة:</span>
          <select
            value={selectedProgramFilter}
            onChange={(e) => setSelectedProgramFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg text-xs px-3 py-2 text-slate-800 font-semibold focus:outline-none"
          >
            <option value="all">جميع الرحلات والبرامج</option>
            {programs.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Groups Grid Cards */}
      {filteredGroups.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Users className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-700 text-sm">لا توجد مجموعات عائلية مطابقة</h3>
          <p className="text-xs text-slate-500">قم بإنشاء مجموعة عائلية لتنظيم تسكين المعتمرين الأقارب معاً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGroups.map((grp) => {
            const grpMembers = pilgrims.filter(p => grp.memberIds.includes(p.id));

            return (
              <div
                key={grp.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow p-5 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                        <h3 className="font-bold text-slate-900 text-sm font-['Alexandria',sans-serif]">
                          {grp.groupName}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#003425]" />
                        <span>{grp.programName}</span>
                      </p>
                    </div>

                    <span className="bg-emerald-50 text-[#003425] text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 shrink-0">
                      {grpMembers.length} أفراد
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">رئيس العائلة:</span>
                      <span className="font-bold text-slate-900">{grp.leaderName}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">رقم التواصل:</span>
                      <span className="font-semibold text-slate-800 dir-ltr flex items-center gap-1">
                        <Phone className="w-3 h-3 text-emerald-600" />
                        {grp.leaderPhone}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">رغبة التسكين:</span>
                      <span className="font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px]">
                        غرفة {grp.roomPreference}
                      </span>
                    </div>
                  </div>

                  {/* Members list preview */}
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                      <span>الأفراد المسجلين للمجموعة:</span>
                    </h4>
                    {grpMembers.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic">لم يتم ربط معتمرين بعد بهذه المجموعة</p>
                    ) : (
                      <div className="space-y-1 max-h-32 overflow-y-auto no-scrollbar">
                        {grpMembers.map((m, idx) => (
                          <div key={m.id} className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded-lg border border-slate-100 text-[11px]">
                            <span className="font-medium text-slate-800">{idx + 1}. {m.fullName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{m.passportNumber}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 gap-2">
                  <button
                    onClick={() => handlePrintGroup(grp)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-slate-600" />
                    <span>طباعة البيان</span>
                  </button>

                  <button
                    onClick={() => onDeleteGroup(grp.id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors border border-rose-100"
                    title="حذف المجموعة العائلية"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Create Family Group */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base font-['Alexandria',sans-serif]">
                إنشاء مجموعة عائلية جديدة
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المجموعة العائلية *</label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                  placeholder="مثال: عائلة الفاسي ومرافقيهم"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">اسم مسافر/مسؤول العائلة *</label>
                  <input
                    type="text"
                    required
                    value={leaderName}
                    onChange={e => setLeaderName(e.target.value)}
                    placeholder="الاسم الكامل"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">هاتف الاتصال والواتساب *</label>
                  <input
                    type="text"
                    required
                    value={leaderPhone}
                    onChange={e => setLeaderPhone(e.target.value)}
                    placeholder="+212 6..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425] dir-ltr text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">البرنامج والرحلة المخصصة *</label>
                <select
                  value={selectedProgramId}
                  onChange={e => setSelectedProgramId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                >
                  {programs.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">تفضيل نوع الغرفة</label>
                  <select
                    value={roomPref}
                    onChange={e => setRoomPref(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                  >
                    <option value="رباعية">غرفة رباعية</option>
                    <option value="ثلاثية">غرفة ثلاثية</option>
                    <option value="ثنائية">غرفة ثنائية VIP</option>
                    <option value="خماسية">غرفة خماسية</option>
                    <option value="فردية">غرفة فردية</option>
                  </select>
                </div>
              </div>

              {/* Select Pilgrims from this Program */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  تحديد المعتمرين المنضمين للمجموعة ({selectedMemberIds.length} محدد):
                </label>
                <div className="border border-slate-200 rounded-xl p-2 max-h-40 overflow-y-auto space-y-1 bg-slate-50">
                  {availablePilgrims.length === 0 ? (
                    <p className="text-[11px] text-slate-400 p-2 text-center">لا يوجد معتمرون غير مخصصين في هذا البرنامج</p>
                  ) : (
                    availablePilgrims.map(p => {
                      const isChecked = selectedMemberIds.includes(p.id);
                      return (
                        <div
                          key={p.id}
                          onClick={() => toggleMemberSelection(p.id)}
                          className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors text-xs ${
                            isChecked ? 'bg-emerald-100 text-[#003425] font-bold border border-emerald-300' : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              className="rounded text-[#003425]"
                            />
                            <span>{p.fullName}</span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{p.passportNumber}</span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات خاصة بالتسكين أو النقل</label>
                <textarea
                  value={groupNotes}
                  onChange={e => setGroupNotes(e.target.value)}
                  rows={2}
                  placeholder="أي طلبات خاصة للغرف أو الوجبات..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-[#003425]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-white bg-[#003425] hover:bg-[#004d37] font-bold shadow-md"
                >
                  حفظ المجموعة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
