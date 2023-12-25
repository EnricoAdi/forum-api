/* eslint-disable linebreak-style */
/* eslint-disable no-undef */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-unused-vars */
/* eslint-disable no-underscore-dangle */
/* eslint-disable class-methods-use-this */
const EncryptionHelper = require('../PasswordHash');

describe('EncryptionHelper interface', () => {
  it('should throw error when invoke abstract behavior', async () => {
    // Arrange
    const encryptionHelper = new EncryptionHelper();

    // Action & Assert
    await expect(encryptionHelper.hash('dummy_password')).rejects.toThrowError('PASSWORD_HASH.METHOD_NOT_IMPLEMENTED');
    await expect(encryptionHelper.comparePassword('plain', 'encrypted')).rejects.toThrowError('PASSWORD_HASH.METHOD_NOT_IMPLEMENTED');
  });
});
