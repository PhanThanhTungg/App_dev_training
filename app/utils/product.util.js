export function truncateText(text, maxLength = 30) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getProductStatusText(status) {
  const statusMap = {
    'ACTIVE': 'Active',
    'DRAFT': 'Draft',
    'ARCHIVED': 'Archived'
  };
  return statusMap[status] || status;
}

export function getProductStatusTone(status) {
  const toneMap = {
    'ACTIVE': 'success',
    'DRAFT': 'warning',
    'ARCHIVED': 'critical'
  };
  return toneMap[status] || 'neutral';
}

export function getProductStatusIcon(status) {
  const iconMap = {
    'ACTIVE': 'check-circle',
    'DRAFT': 'alert-triangle',
    'ARCHIVED': 'archive'
  };
  return iconMap[status] || 'info';
}
