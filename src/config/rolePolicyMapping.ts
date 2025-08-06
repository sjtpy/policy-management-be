import { EmployeeRole } from '../types/employee';
import { PolicyType } from '../types/policy';

export const ROLE_POLICY_MAPPING: Record<EmployeeRole, PolicyType[]> = {
    [EmployeeRole.HR]: [
        PolicyType.DATA_PRIVACY,
        PolicyType.ACCEPTABLE_USE,
        PolicyType.INFOSEC
    ],
    [EmployeeRole.ENGINEERING]: [
        PolicyType.INFOSEC,
        PolicyType.ACCEPTABLE_USE,
        PolicyType.CRYPTOGRAPHIC,
        PolicyType.DATA_PRIVACY
    ],
    [EmployeeRole.SALES]: [
        PolicyType.ACCEPTABLE_USE,
    ],
    [EmployeeRole.EXECUTIVE]: [
        PolicyType.CRYPTOGRAPHIC
    ]
}; 