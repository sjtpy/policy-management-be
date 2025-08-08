import { PolicyStatus } from '../types/policy';

export const POLICY_CONFIG = {
    EFFECTIVE_DURATION_DAYS: 365 * 5,
    DEFAULT_STATUS: PolicyStatus.PENDING_APPROVAL
};

export const ACKNOWLEDGMENT_CONFIG = {
    NEW_HIRE_DUE_DAYS: 30,
    PERIODIC_YEARS: 3
}; 