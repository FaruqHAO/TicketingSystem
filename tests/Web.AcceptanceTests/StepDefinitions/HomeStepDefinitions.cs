namespace TicketingSystem.Web.AcceptanceTests.StepDefinitions;

[Binding]
public sealed class HomeStepDefinitions(HomePage homePage)
{
    [BeforeFeature("Home")]
    public static async Task BeforeHomeFeature(IObjectContainer container)
    {
        var context = await PlaywrightSetup.Browser.NewContextAsync();
        var page = await context.NewPageAsync();
        container.RegisterInstanceAs(context);
        container.RegisterInstanceAs(new HomePage(page));
    }

    [AfterFeature]
    public static async Task AfterHomeFeature(IObjectContainer container)
    {
        var context = container.Resolve<IBrowserContext>();
        await context.DisposeAsync();
    }

    [Given("a user visits the home page")]
    public Task GivenAUserVisitsTheHomePage() => homePage.GotoAsync();

    [Then("the heading contains {string}")]
    public Task ThenTheHeadingContains(string text) => homePage.AssertHeadingContains(text);

    [Then("the sign in and sign up actions are offered")]
    public async Task ThenTheSignInAndSignUpActionsAreOffered()
    {
        await homePage.AssertSignInOffered();
        await homePage.AssertSignUpOffered();
    }
}
