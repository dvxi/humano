import { requireAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, DollarSign, Mail } from 'lucide-react';

async function getTrainers() {
  const trainers = await db.trainer.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
          image: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return trainers;
}

export default async function TrainersPage() {
  const user = await requireAuth();
  const trainers = await getTrainers();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Find a Trainer</h1>
        <p className="text-muted-foreground">
          Browse certified trainers and find the perfect coach for your fitness journey
        </p>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Trainers</CardTitle>
          <CardDescription>Filter by location, price, or specialization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input placeholder="Search by name or location..." className="flex-1" />
            <Button variant="outline">Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Trainers List */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Available Trainers ({trainers.length})</h2>

        {trainers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No trainers available yet. Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {trainers.map((trainer) => {
              const initials =
                trainer.user.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || 'T';

              return (
                <Card key={trainer.id}>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={trainer.user.image || undefined} />
                        <AvatarFallback>{initials}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle>{trainer.user.name || 'Trainer'}</CardTitle>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {trainer.location && (
                            <Badge variant="outline" className="gap-1">
                              <MapPin className="h-3 w-3" />
                              {trainer.location}
                            </Badge>
                          )}
                          {trainer.pricePerSession && (
                            <Badge variant="outline" className="gap-1">
                              <DollarSign className="h-3 w-3" />${trainer.pricePerSession}/session
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {trainer.bio && (
                      <div>
                        <p className="text-sm text-muted-foreground">{trainer.bio}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      {trainer.contact && (
                        <Button variant="outline" size="sm" className="flex-1" asChild>
                          <a
                            href={
                              trainer.contact.includes('@')
                                ? `mailto:${trainer.contact}`
                                : `tel:${trainer.contact}`
                            }
                          >
                            <Mail className="mr-2 h-4 w-4" />
                            Contact
                          </a>
                        </Button>
                      )}
                      <Button size="sm" className="flex-1">
                        View Profile
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Become a Trainer */}
      {user.role === 'USER' && (
        <Card className="bg-muted">
          <CardHeader>
            <CardTitle>Are you a trainer?</CardTitle>
            <CardDescription>
              Join our platform and connect with athletes looking for coaching
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>Switch to Trainer Account</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
