import * as vaultService from '../vaultService';
import * as word from '../wordIntegration';
import * as bridge from '../msOfficeVaultBridge.js';

// Mock implementations
jest.mock('../vaultService');
jest.mock('../wordIntegration');

const mockedDownload = vaultService.downloadDocument as jest.Mock;
const mockedUpload = vaultService.uploadDocument as jest.Mock;
const mockedInit = word.initializeOfficeJS as jest.Mock;
const mockedOpen = word.openWordDocument as jest.Mock;
const mockedGetContent = word.getDocumentContent as jest.Mock;

describe('msOfficeVaultBridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('loadWordDocument downloads and opens the file', async () => {
    const blob = new Blob(['dummy'], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    mockedDownload.mockResolvedValue(blob);
    mockedInit.mockResolvedValue(undefined);
    mockedOpen.mockResolvedValue(undefined);

    await bridge.loadWordDocument('doc123');

    expect(mockedDownload).toHaveBeenCalledWith('doc123');
    expect(mockedInit).toHaveBeenCalled();
    expect(mockedOpen).toHaveBeenCalled();
  });

  test('syncChangesToVault uploads new version', async () => {
    mockedGetContent.mockResolvedValue('<p>content</p>');
    mockedUpload.mockResolvedValue({ success: true });

    await bridge.syncChangesToVault('doc123');

    expect(mockedGetContent).toHaveBeenCalled();
    expect(mockedUpload).toHaveBeenCalled();
  });
});
