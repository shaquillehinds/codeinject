SHA=$(git rev-parse head)
docker build --platform linux/x86_64 -t <username>/<reponame>:latest .
docker build --platform linux/x86_64 -t <username>/<reponame>:$SHA .

docker push <username>/<reponame>:latest
docker push <username>/<reponame>:$SHA

echo $SHA