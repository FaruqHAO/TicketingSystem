namespace TicketingSystem.Application.Audit.Queries.GetAuditTrail;

public class GetAuditTrailQueryValidator : AbstractValidator<GetAuditTrailQuery>
{
    public GetAuditTrailQueryValidator()
    {
        RuleFor(x => x.PageNumber).GreaterThanOrEqualTo(1);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 200);
    }
}
