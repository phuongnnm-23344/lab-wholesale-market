## 1. Summary
<!-- Brief description of changes -->

Close #[ID Task]

## 2. Type of Change
- [ ] Feature
- [ ] Bug Fix
- [ ] Hotfix
- [ ] Refactoring
- [ ] Documentation
- [ ] Performance Improvement

## 3. Self-Review Checklist

### Code Quality
- [ ] Code follows project coding conventions
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated (if applicable)
- [ ] Local build passes
- [ ] No new warnings introduced
- [ ] Debug/Test logs removed

### Security
- [ ] No hardcoded credentials or sensitive data
- [ ] Input validation implemented
- [ ] Authorization checks in place

## 4. Operations & Deployment Impact 

### Database Changes
- [ ] **Database Migration Required:** Yes / No
 - If Yes, list migration files:
 ```
 db/migrate/YYYYMMDD_migration_name.rb
 ```
 - [ ] Migration is reversible (has `down` method)
 - [ ] Migration tested on staging
 - [ ] Data migration script prepared (if needed)

### Environment Variables
- [ ] **Environment Variables Changed:** Yes / No
 - If Yes, list changes:
 ```
 # New variables:
 NEW_API_KEY=xxx
 TIMEOUT_MS=5000

 # Updated variables:
 OLD_VAR_NAME NEW_VAR_NAME

 # Removed variables:
 DEPRECATED_VAR
 ```
 - [ ] `.env.example` updated
 - [ ] Documentation updated

### Dependencies
- [ ] **New Dependencies Added:** Yes / No
 - If Yes, list packages:
 ```
 - package-name@version
 ```
 - [ ] Security audit passed
 - [ ] License compatibility checked

### Configuration Files
- [ ] **Config Files Modified:** Yes / No
 - If Yes, list files:
 ```
 - nginx.conf
 - firebase.json
 ```

### Infrastructure
- [ ] **Requires Infrastructure Changes:** Yes / No
 - If Yes, describe:
 - [ ] Infrastructure checklist completed

### API Changes
- [ ] **Breaking API Changes:** Yes / No
 - If Yes, describe impact:
 - [ ] API documentation updated
 - [ ] Migration guide provided

### Mobile Specific (if applicable)
- [ ] App version/build number incremented
- [ ] Target scheme verified
- [ ] Certificate validity checked (iOS)
- [ ] Icon assets verified
- [ ] ABIs correct (Android NDK)
- [ ] Min/Max SDK levels correct
- [ ] Google Play policy compliance
- [ ] Force update required: Yes / No

## 5. Release Dependencies
- [ ] **Must be released together with:**
 - [ ] Backend: PR #
 - [ ] Frontend: PR #
 - [ ] Mobile iOS: PR #
 - [ ] Mobile Android: PR #

## 6. Deployment Notes

### Pre-Deployment Steps
```bash
# Scripts to run before deployment
# Example: bundle exec rake pre_deploy:task
```

### Post-Deployment Steps
```bash
# Scripts to run after deployment
# Example: bundle exec rake post_deploy:task
```

### Verification Steps
- [ ] Health check endpoint responds
- [ ] Key features tested in production
- [ ] Third-party integrations verified (SMS, Payment, etc.)
- [ ] Monitoring/Logs checked

### Rollback Plan
- [ ] Rollback procedure documented
- [ ] Database rollback plan (if DB changes)
- [ ] Estimated rollback time:

## 7. Testing

### Test Coverage
- [ ] Unit tests: X% coverage
- [ ] Integration tests passed
- [ ] E2E tests passed (if applicable)

### Manual Testing
- [ ] Tested on development
- [ ] Tested on staging
- [ ] QA approved

### Performance Testing
- [ ] Load testing performed (if needed)
- [ ] No performance degradation

## 8. Documentation
- [ ] README updated
- [ ] API documentation updated
- [ ] Changelog updated
- [ ] Release notes prepared

## 9. Screenshots/Demo
<!-- If UI changes, provide before/after screenshots -->

## 10. Additional Notes
<!-- Any other relevant information -->

---

**For Reviewers:**
- [ ] Code reviewed
- [ ] Operations impact reviewed
- [ ] Security reviewed
- [ ] Performance reviewed
