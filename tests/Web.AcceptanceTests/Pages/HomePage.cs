namespace TicketingSystem.Web.AcceptanceTests.Pages;

public class HomePage(IPage page) : BasePage(page)
{
    public override string PagePath => BaseUrl;

    // The hero headline is set across two lines, so match a fragment rather than the
    // whole string.
    public Task AssertHeadingContains(string text)
        => Assertions.Expect(Page.Locator("h1")).ToContainTextAsync(text);

    // Sign in appears in the nav, the hero and the closer; any one of them proves the
    // page offers it, so take the first.
    public Task AssertSignInOffered()
        => Assertions.Expect(Page.GetByRole(AriaRole.Link, new() { Name = "Sign in", Exact = true }).First)
            .ToBeVisibleAsync();

    public Task AssertSignUpOffered()
        => Assertions.Expect(Page.Locator("a[href='/register']").First).ToBeVisibleAsync();
}
