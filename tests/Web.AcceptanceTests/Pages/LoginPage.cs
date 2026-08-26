namespace TicketingSystem.Web.AcceptanceTests.Pages;

public class LoginPage(IPage page) : BasePage(page)
{
    public override string PagePath => $"{BaseUrl}/login";

    public Task SetEmail(string email)
        => Page.FillAsync("#email", email);

    public Task SetPassword(string password)
        => Page.FillAsync("#password", password);

    public Task ClickLogin()
        => Page.Locator("button[type='submit']").ClickAsync();

    // A successful sign-in lands on /dashboard, which redirects to the desk the account's
    // role owns — the administrator seed lands on the admin overview.
    public Task AssertSignedIn()
        => Assertions.Expect(Page.Locator(".dl__topbar h1")).ToHaveTextAsync("Desk overview");

    public Task AssertSignOutAvailable()
        => Assertions.Expect(Page.Locator("button[aria-label='Sign out']")).ToBeVisibleAsync();

    public Task AssertErrorVisible()
        => Assertions.Expect(Page.Locator("#login-error")).ToBeVisibleAsync();
}
