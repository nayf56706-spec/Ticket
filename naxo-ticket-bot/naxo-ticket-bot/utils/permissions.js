const config = require('../config');

/** هل العضو Owner (كل الصلاحيات) */
function isOwner(member) {
  if (!member) return false;
  if (member.guild.ownerId === member.id) return true;
  return member.roles.cache.has(config.ownerRoleId);
}

/** هل العضو Administrator */
function isAdministrator(member) {
  if (!member) return false;
  if (member.permissions.has('Administrator')) return true;
  return member.roles.cache.has(config.adminRoleId);
}

/** هل العضو Staff */
function isStaff(member) {
  if (!member) return false;
  return member.roles.cache.has(config.staffRoleId);
}

/** الإدارة = Owner أو Administrator أو Staff (لأوامر مثل claim/add/remove) */
function isManagement(member) {
  return isOwner(member) || isAdministrator(member) || isStaff(member);
}

/** من يملك صلاحية إغلاق/حذف التذكرة = Owner أو Administrator فقط (وفق الملف) */
function canCloseOrDelete(member) {
  return isOwner(member) || isAdministrator(member);
}

/** من يملك صلاحية استلام التذكرة = Owner, Administrator, Staff */
function canClaim(member) {
  return isOwner(member) || isAdministrator(member) || isStaff(member);
}

/** من يملك صلاحية إضافة/إزالة أعضاء = Owner, Administrator, Staff */
function canAddRemoveMembers(member) {
  return isOwner(member) || isAdministrator(member) || isStaff(member);
}

/** من يملك صلاحية تغيير الاسم / إنشاء Transcript = Owner, Administrator */
function canRenameOrTranscript(member) {
  return isOwner(member) || isAdministrator(member);
}

module.exports = {
  isOwner,
  isAdministrator,
  isStaff,
  isManagement,
  canCloseOrDelete,
  canClaim,
  canAddRemoveMembers,
  canRenameOrTranscript,
};
