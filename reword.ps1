git reset --hard 5217af2

git cherry-pick -n 4f7e42e
git commit -m "Implement MapanSetu design system (Phase 1)"

git cherry-pick -n f94cf67
git commit -m "Build Business application shell (Phase 2)"

git cherry-pick -n fce1192
git commit -m "Implement Business Dashboard (Phase 3)"

git cherry-pick -n f0fdf5d
git commit -m "Implement Business Instruments management (Phase 4)"

git cherry-pick -n 3c2e5f3
git commit -m "Implement Business Applications filing and tracking (Phase 5)"

git cherry-pick -n d0283f3
git commit -m "Implement Business Certificates record views (Phase 6)"

git cherry-pick -n 0a4caef
git commit -m "Implement Business Notifications center (Phase 7)"

git cherry-pick -n 8223416
git commit -m "Implement Business Profile (Phase 8)"

git cherry-pick -n 587e05b
git commit -m "Add baseline audit and agent development guidelines (Phase 0 and 9)"

git push -f origin feature-vishal
