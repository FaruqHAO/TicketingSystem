@Home
Feature: Home

Scenario: The landing page invites the visitor to sign in
    Given a user visits the home page
    Then the heading contains "answered on time"
    And the sign in and sign up actions are offered
