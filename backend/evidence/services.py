"""Domain logic for the evidence module.

Views stay thin: they validate input with a serializer, call a service, and
shape the response. State transitions, ownership checks, and cross-module
effects belong here.
"""
