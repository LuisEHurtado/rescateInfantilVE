import { Badge } from '../ui/Badge';
import { caseStatusColor, caseStatusLabel } from '../../utils/labels';
import { CaseStatus } from '../../types';

export function ChildStatusBadge({ status }: { status: CaseStatus }) {
  return <Badge className={caseStatusColor[status]}>{caseStatusLabel[status]}</Badge>;
}
