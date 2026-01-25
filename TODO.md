# TODO

## Done

- [x] Set project up
- [x] Install all dependencies
- [x] Create API client
- [x] Create basic layout
- [x] Start drag-and-drop file upload page
- [x] Create draft settings bar

## Next

- [x] Finish SSE conversion flow on the frontend (start conversion, subscribe to progress events, display progress/state, handle errors/cancel/retry)
- [x] Implement download flow for converted file(s) (success state + “Download” action, filename handling)
- [ ] Improve settings bar (UX + visuals) to match overall composition (layout, spacing, typography, states, accessibility)
- [x] SSE error retry handle (when sse fails we should be able to retry sse with button: check task status with api req first, then when pending - make sse req again)
- [x] On task status get, when its errored - make retry flow

## Later

- [ ] Add re-upload / convert-another flow after completing a conversion (reset state, preserve settings as appropriate, allow converting multiple files in one session)
- [ ] Support chunked uploads for files >2GB (integrate with backend chunk upload APIs, resume/retry, progress UI)
