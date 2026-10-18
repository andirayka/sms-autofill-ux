export type SmsRetrieverModuleEvents = {
  onSms: (params: { message: string }) => void;
  onTimeout: () => void;
};
