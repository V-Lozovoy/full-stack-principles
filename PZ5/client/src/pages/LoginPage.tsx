interface Props {
  onSuccess: () => void
}

// TODO(3) [Пз5 · Л5, «useState: керована форма входу» і «Помилка доходить до поля»]: форма входу і реєстрації.
//
//   • Керовані поля: value + onChange, значення живе у useState, не в DOM.
//     Забули onChange — поле не реагуватиме на введення.
//   • <form onSubmit={...}> і <button type="submit">, а не <div onClick>:
//     Enter, валідація браузера і скрінрідери працюють безкоштовно.
//   • Стан busy: кнопка вимкнена, поки летить запит.
//   • POST /auth/login → setToken(token) → onSuccess().
//     Перемикач «вхід / реєстрація» — спершу POST /auth/register.
//
//   • Помилки. Текст — той, що прийшов у полі error від сервера, а не
//     «щось пішло не так». Плюс розбивка по полях:
//         catch (err) {
//           setError(err instanceof Error ? err.message : '…')
//           setFieldErrors(err instanceof ApiError ? err.fieldErrors() : {})
//         }
//     Критерій: під полем пароля має зʼявитися «Мінімум 8 символів»,
//     а не «Помилка 400» угорі. Додайте aria-invalid, щоб про помилку
//     дізнався і скрінрідер.
//
// Як видно, що не зроблено: увійти неможливо.

export default function LoginPage(_props: Props) {
  return <form className="card form">TODO(3): форма входу</form>
}
