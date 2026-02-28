// NFC types — reader state and card data
export type NFCReaderStatus = 'unsupported' | 'idle' | 'reading' | 'error'

export interface NFCCardData {
  serialNumber: string
  records: NFCRecord[]
  readAt: number
}

export interface NFCRecord {
  recordType: string
  data: string
  mediaType?: string
}

export interface NFCReaderState {
  status: NFCReaderStatus
  card: NFCCardData | null
  error: string | null
}
