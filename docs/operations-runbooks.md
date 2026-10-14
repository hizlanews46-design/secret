# Operations runbooks

## Migration verification

1. Confirm the target Supabase ref is `tqzchcbbkwycjhaegmgi`.
2. Apply migrations in filename order.
3. Verify RLS is enabled on `profiles`, `user_vault`, `workflow_runs`, `audit_events`, `partner_agreements`, and `integration_feature_flags`.
4. Run the application checks and call `GET /api/health`.
5. Record the migration version in the release notes.

## Credential incident

1. Do not copy the suspected secret into a ticket, chat, log, or screenshot.
2. Ask the owner to revoke the provider credential through the provider’s official console.
3. Delete the affected ciphertext from Vaultline after confirming the provider-side revocation.
4. Review audit metadata for scope and time, without attempting to reconstruct plaintext.
5. Rotate affected sessions and document the incident without secret values.

## Backup and restore

- Back up Supabase database metadata and encrypted ciphertext according to the account retention policy.
- Treat backups as sensitive even though ciphertext is opaque.
- Test restore in an isolated project before any production restore.
- The vault passphrase is not backed up by Vaultline; recovery follows `/recovery`.

## Abandoned workflows

Workflows in `awaiting-consent`, `awaiting-user`, or `running` should receive an expiry policy before a background cleanup job is enabled. Cleanup must only update safe metadata and must never reveal or export secrets.
